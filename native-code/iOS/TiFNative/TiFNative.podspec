Pod::Spec.new do |s|
  s.name           = 'TiFNative'
  s.version        = '1.0.0'
  s.summary        = 'iOS Native Code for tiF.'
  s.description    = 'A sample project description'
  s.author         = ''
  s.platform       = :ios, '13.0'
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.source         = { :git => 'https://github.com/tifapp/FitnessProject.git', :tag => s.version.to_s }
  s.license        = { :type => 'MIT' }
  s.source_files   = 'Sources/TiFNative/**/*.swift'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end
