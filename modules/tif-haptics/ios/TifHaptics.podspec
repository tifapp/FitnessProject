Pod::Spec.new do |s|
  s.name           = 'TifHaptics'
  s.version        = '1.0.0'
  s.summary        = 'A sample project summary'
  s.description    = 'A sample project description'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platform       = :ios, '13.0'
  s.source         = { :git => 'https://github.com/tifapp/FitnessProject.git', :tag => s.version.to_s }
  s.license        = { :type => 'MIT' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'TiFNative', '1.0.0'  # Just specify version, no path

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
